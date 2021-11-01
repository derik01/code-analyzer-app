315 Code Analyzer Application
=============================

Running in development mode:
1. Install [docker](https://www.docker.com/)
2. Install [docker-compose](https://docs.docker.com/compose/install/)
3. Enter the `code-analyzer-app` directory
4. Run `docker-compose up`

Structure:
```
.
├── back-end : contains all files for back-end
│   ├── auth : all routes relating to authentication
│   ├── Dockerfile
│   ├── requirements.txt : dependencies for back-end 
│   ├── user : all routes requiring authentication
│   └── wsgi.py : flask entrypoint
├── docker-compose.yml
├── front-end
│   ├── Dockerfile
│   ├── next-env.d.ts
│   ├── package.json : dependencies for front-end
│   ├── package-lock.json
│   ├── pages : pages which are rendered
│   ├── public : independent assets which are statically served 
│   ├── src : src for custom loaders
│   ├── styles : custom scss
│   └── tsconfig.json
├── nginx : files for configuring the reverse proxy (to combine the front-end and back-end into a single site)
│   ├── default.conf
│   ├── Dockerfile
│   └── nginx.conf
└── README.md
```