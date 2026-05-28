FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS backend-build
WORKDIR /src

COPY backend/CollaborationSystem.sln ./backend/
COPY backend/NuGet.config ./backend/
COPY backend/src ./backend/src

RUN dotnet restore backend/src/CollaborationSystem.Api/CollaborationSystem.Api.csproj
RUN dotnet publish backend/src/CollaborationSystem.Api/CollaborationSystem.Api.csproj \
    -c Release \
    --no-restore \
    -o /app/publish

FROM node:22-alpine AS frontend-build
WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS dotnet-runtime

FROM postgres:16 AS runtime

WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_DB=collaboration_system
ENV POSTGRES_USER=postgres
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH=$PATH:/usr/share/dotnet

COPY --from=dotnet-runtime /usr/share/dotnet /usr/share/dotnet
COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /app/dist ./wwwroot
COPY docker/all-in-one/start.sh /usr/local/bin/start-collaboration-system

RUN chmod +x /usr/local/bin/start-collaboration-system \
    && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
    && mkdir -p /root/.aspnet/DataProtection-Keys \
    && chown -R postgres:postgres /var/lib/postgresql

VOLUME ["/var/lib/postgresql/data", "/root/.aspnet/DataProtection-Keys"]
EXPOSE 8080

ENTRYPOINT ["start-collaboration-system"]
