# Law Firm System

The Vite/React frontend is in the workspace root. The Spring Boot backend is in
`Backend/backend` and uses Maven.

## Run the packaged demo

The Spring Boot jar serves both the frontend and API on port 8080. Before
running it, start PostgreSQL and configure its connection in
`Backend/backend/src/main/resources/application.properties`. Set `JWT_SECRET`
to a secret that is at least 32 characters long.

In PowerShell:

```powershell
$env:JWT_SECRET = "replace-with-a-secret-of-at-least-32-characters"
.\build-and-run.bat
```

In a POSIX shell:

```sh
export JWT_SECRET='replace-with-a-secret-of-at-least-32-characters'
sh build-and-run.sh
```

Each script builds the frontend, copies `dist/` into the backend's
`src/main/resources/static/`, packages the Spring Boot jar, and runs it. Open
<http://localhost:8080> and stop the server with Ctrl+C.

To run the steps manually from the workspace root:

```sh
npm run build
```

Then copy the contents of `dist/` to
`Backend/backend/src/main/resources/static/`, and from `Backend/backend` run:

```sh
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

On Windows, use `mvnw.cmd clean package` instead of `./mvnw clean package`.
When running Vite for development, requests under `/api` are proxied to the
backend at `http://localhost:8080`.
