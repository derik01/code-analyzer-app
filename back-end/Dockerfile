FROM python:3

RUN apt-get -qq -y update

RUN apt-get -qq -y --allow-downgrades --allow-remove-essential --allow-change-held-packages install \
  clang-tidy

WORKDIR /back-end

ENV FLASK_ENV=development

COPY . .

RUN rm -rf venv

RUN python3 -m venv venv

RUN . ./venv/bin/activate

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3001

CMD [ "python", "./src/wsgi.py" ]
