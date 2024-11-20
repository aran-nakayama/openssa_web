from pathlib import Path
from functools import cache
from dotenv import load_dotenv
from openssa import DANA, FileResource, ProgramStore, HTPlanner
from openssa.core.util.lm.openai import OpenAILM
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import asyncio
from typing import AsyncGenerator
import logging
import sys
from io import StringIO
import queue
import threading

load_dotenv()

DOCS_DATA_LOCAL_DIR_PATH: Path = Path(__file__).parent / '.data'
app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# スレッドセーフなメッセージキューを作成
message_queue = queue.Queue()

# ログをキャプチャするためのカスタムハンドラー
class StringIOHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.stream = StringIO()

    def emit(self, record):
        try:
            msg = self.format(record)
            
            # デバッグ用のメッセージは除外
            if any(keyword in msg for keyword in [
                "load_ssl_context",
                "verify=True",
                "INFO:",
                "DEBUG:",
                "WARNING:",
                "ERROR:",
                "chunk:",
                "b'data:",
                "b\"data:",
                "it/s]",
            ]):
                return

            # 空行や特殊文字のみの行は除外
            if not msg.strip() or msg.strip() in ["│", "─", "└", "├"]:
                return
                
            # メッセージを整形
            formatted_msg = msg.strip()
            
            # 特定のキーワードを日本語に置換
            replacements = {
                "EXECUTING HIERACHICAL TASK PLAN": "【実行開始】階層的タスク計画",
                "TASK-LEVEL REASONING": "【推論開始】タスクレベルの推論",
                "PLAN(task=": "計画(タスク=",
                "subs=[": "サブタスク=[",
            }
            
            for eng, jpn in replacements.items():
                formatted_msg = formatted_msg.replace(eng, jpn)
            
            # 整形したメッセージをキューに追加
            if formatted_msg.strip():
                message_queue.put(formatted_msg)
                
        except Exception as e:
            print(f"Error in log handler: {e}")

# グローバルなログハンドラーを設定
io_handler = StringIOHandler()
io_handler.setFormatter(logging.Formatter('%(message)s'))
logging.getLogger().addHandler(io_handler)
logging.getLogger().setLevel(logging.DEBUG)

async def log_generator(request: Request) -> AsyncGenerator[dict, None]:
    """ログメッセージを非同期で生成するジェネレーター"""
    try:
        while True:
            if await request.is_disconnected():
                break
                
            try:
                # キューからメッセージを取得（タイムアウトなし）
                msg = message_queue.get_nowait()
                if msg:  # メッセージが空でない場合のみ送信
                    yield {"data": msg}
            except queue.Empty:
                await asyncio.sleep(0.1)
                continue
                
    except Exception as e:
        print(f"Error in log generator: {e}")
    finally:
        # 接続が切れた場合はキューをクリア
        while not message_queue.empty():
            message_queue.get()

@cache
def get_main_lm():
    return OpenAILM.from_defaults()

@cache
def get_or_create_program_store() -> ProgramStore:
    return ProgramStore()

@cache
def get_or_create_agent(use_knowledge: bool = False, use_program_store: bool = False) -> DANA:
    knowledge = None if not use_knowledge else {"KnowledgeBase"}
    program_store = get_or_create_program_store() if use_program_store else ProgramStore()

    return DANA(
        knowledge=knowledge,
        program_store=program_store,
        programmer=HTPlanner(lm=get_main_lm(), max_depth=1, max_subtasks_per_decomp=2),
        resources={FileResource(path=DOCS_DATA_LOCAL_DIR_PATH)}
    )

def solve(question: str, use_knowledge: bool, use_program_store: bool) -> str:
    agent = get_or_create_agent(use_knowledge=use_knowledge, use_program_store=use_program_store)
    try:
        return agent.solve(problem=question)
    except Exception as err:
        return f'ERROR: {err}'

class QuestionRequest(BaseModel):
    question: str
    use_knowledge: bool = False
    use_program_store: bool = False

@app.get("/solve/stream")
async def stream_solve(request: Request, question: str, use_knowledge: bool = False, use_program_store: bool = False):
    """ソルブ処理のログをストリーミングするエンドポイント"""
    return EventSourceResponse(log_generator(request))

@app.post("/solve")
async def solve_question(body: QuestionRequest):
    """既存のソルブエンドポイント"""
    loop = asyncio.get_event_loop()
    # ThreadPoolExecutorを使用してsolveを実行
    answer = await loop.run_in_executor(
        None, 
        solve,
        body.question,
        body.use_knowledge,
        body.use_program_store
    )
    return {"answer": answer}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/sse-test")
async def sse_test(request: Request):
    """SSEテスト用エンドポイント"""
    async def event_generator():
        for i in range(10):
            if await request.is_disconnected():
                break
            yield {"data": f"テストメッセージ {i}"}
            await asyncio.sleep(1)  # 1秒ごとにメッセージを送信

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 