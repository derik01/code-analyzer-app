FROM node:current

WORKDIR /front-end

ENV NODE_ENV=development
ENV PORT=3000
ENV URI=localhost

COPY . ./

RUN rm -rf ./node_modules
RUN rm -rf ./.next/

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]