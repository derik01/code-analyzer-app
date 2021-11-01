FROM python:3

WORKDIR /src

ENV FLASK_ENV=development

COPY . .

RUN rm -rf venv

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3001

CMD [ "python", "./wsgi.py" ]