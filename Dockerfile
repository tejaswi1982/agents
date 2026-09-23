FROM python:3.12-alpine AS build
WORKDIR /app
COPY content ./content
COPY scripts/build.py ./scripts/build.py
COPY public ./public
RUN python scripts/build.py

FROM nginx:stable-alpine
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
