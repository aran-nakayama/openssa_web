# React + FastAPI アプリケーション

このプロジェクトは、React（フロントエンド）とFastAPI（バックエンド）を使用した基本的なウェブアプリケーションです。

## セットアップ方法

### ローカル環境でのセットアップ

#### バックエンド

1. **プロジェクトのルートディレクトリに移動します**:
   ターミナルまたはコマンドプロンプトを開き、プロジェクトのルートディレクトリに移動します。

2. **`backend`ディレクトリに移動し、Pythonの仮想環境を作成し、アクティブにします**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windowsの場合は `venv\Scripts\activate`
   ```

3. **必要なパッケージをインストールします**:
   ```bash
   pip install fastapi uvicorn
   ```

4. **サーバーを起動します**:
   ```bash
   uvicorn main:app --reload
   ```

#### フロントエンド

1. 別のターミナルを開き`frontend`ディレクトリに移動します。
   ```bash
   cd frontend
   ```

2. 必要なパッケージをインストールします。
   ```bash
   npm install
   ```

3. 開発サーバーを起動します。
   ```bash
   npm start
   ```

### Dockerコンテナでのセットアップ

1. **プロジェクトのルートディレクトリに移動します**:
   ターミナルまたはコマンドプロンプトを開き、プロジェクトのルートディレクトリに移動します。

2. **Docker Composeを使用してコンテナを起動します**:
   ```bash
   docker-compose up --build
   ```

3. **アプリケーションにアクセスします**:
   - フロントエンド: `http://localhost:3000`
   - バックエンド: `http://localhost:8000`

## プロジェクト構成

- `backend/main.py`: FastAPIのエントリーポイント。
- `frontend/src/App.tsx`: Reactのメインコンポーネント。

## 使用技術

- **フロントエンド**: React
- **バックエンド**: FastAPI
- **プロキシ**: `http-proxy-middleware`を使用して、フロントエンドからバックエンドへのAPIリクエストをプロキシ。

## 注意事項

- フロントエンドはデフォルトで`http://localhost:3000`で動作し、バックエンドは`http://localhost:8000`で動作します。
- CORS設定は`backend/main.py`で行われています。

## ライセンス

このプロジェクトはMITライセンスの下で提供されています。