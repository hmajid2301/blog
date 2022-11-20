FROM python

WORKDIR /feed2toot
RUN pip3 install feed2toot

COPY . .
CMD ["feed2toot", "-c", "./feed2toot.ini"]

