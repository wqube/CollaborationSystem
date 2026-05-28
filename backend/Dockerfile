FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY CollaborationSystem.sln ./
COPY NuGet.config ./
COPY src ./src

RUN dotnet restore src/CollaborationSystem.Api/CollaborationSystem.Api.csproj
RUN dotnet publish src/CollaborationSystem.Api/CollaborationSystem.Api.csproj \
    -c Release \
    --no-restore \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish ./

EXPOSE 8080
ENTRYPOINT ["dotnet", "CollaborationSystem.Api.dll"]
