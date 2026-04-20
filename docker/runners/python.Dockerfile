# Minimal image for running Python programs in the judge sandbox.
FROM python:3.12-alpine

RUN addgroup -S judge && adduser -S -G judge -h /home/judge judge

WORKDIR /workspace
USER judge

CMD ["/bin/sh"]
