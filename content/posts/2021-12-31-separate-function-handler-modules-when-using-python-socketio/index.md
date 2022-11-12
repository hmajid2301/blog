---
title: Separate function handler modules when using Python Socketio
canonicalURL: https://haseebmajid.dev/posts/2021-12-31-separate-function-handler-modules-when-using-python-socketio/
tags:
  - python
  - socketsio
  - websockets
  - fastapi
  - code-organisation
date: 2021-12-31
cover:
  image: images/cover.png
---

In this article I will show you how you can have separate modules for your Socketio event handlers.
Rather than keeping them all in the same file.

Hopefully this should be a relatively short article, lets get into it

## Main

In this example I will be using SocketIO alongside FastAPI, but you can easily change this code to be SocketIO
only. I also will be using a uvicorn to run the server.

For example

```python
from fastapi import FastAPI
from fastapi_socketio import SocketManager

application = FastAPI(title="banter-bus-core-api")
socket_manager = SocketManager(app=application, mount_location="/")
```

Here is where we setup our FastAPI application and create a Socketio server as a sub-application and mount it.

{{< admonition type="info" title="fastapi-socketio" details="false" >}}
Here I am using the `fastapi-socketio` library to handle mounting the application into the Fastapi app.
But this again can be done without the library, see this [Github issue](https://github.com/tiangolo/fastapi/issues/129#issuecomment-547806432) for an example.
{{< /admonition >}}

Anyhow we could simply do something like, this create a Socketio only server without FastAPI.

```python
import socketio

sio = socketio.AsyncServer()
application = socketio.ASGIApp(sio)
```

## Handler Module

Next lets take a look at the module which will handle our various events it should listen to from the client.

```python
from app.main import socket_manager as sm


@sm.on("FOO")
async def foo_event(sid, *args, **kwargs):
    await sm.emit("BAR", {"response": "hello world!"})
```

As you can see this handler imports the socket manager object in the second example this would be the object called ` sio`. Then decorates a function, this function then will be called everytime a client sends an `FOO` event
to our web server. In this example it returns a `BAR` event (emits it) with `hello world`.
What this function does specifically doesn't really matter.

## **init**.py

Finally let's put all this in our `app/__init__.py` module:

```python
import uvicorn

import app.foo.foo_handlers
from app.main import application

app = application

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

This may look a bit confusing, essentially this is the module that uvicorn will call directly to start the server. When then import our function handlers `import app.foo.foo_handlers`, here you will need to import
all of your function handlers, even though they aren't used here. So this is so that your application knows
they exist.

Without this import your application will have no way to "attach" them to the app. Now everytime the `FOO`
event is emitted from a client, your server knows to send it that function.

Finally we create a simple dummy variable `app = application` where application is the FastAPI/ASGIApp we
created in the `main.py` module. You could leave this as application but usually when using uvicorn
, i.e. looking at examples it will use `app`. So hence I've renamed it here.

The final block is not really needed:

```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

It more exists if this module is used as a main file and will start the uvicorn server for us. However typically I will start the uvicorn server myself, usually in my Docker images or launch.json (VSCode debugger) config etc.

```bash
uvicorn app:app --host "0.0.0.0" --port 8080
```

## Appendix

- [Example project using this pattern](https://gitlab.com/banter-bus/banter-bus-core-api)
