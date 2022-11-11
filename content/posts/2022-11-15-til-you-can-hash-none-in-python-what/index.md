---
title: "TIL: You can Hash `None` in Python? What?"
canonicalURL: https://haseebmajid.dev/posts/2022-11-15-til-you-can-hash-none-in-python-what/
date: 2022-11-15
tags:
  - python
series:
  - TIL
---

**TIL you can hash `None` in Python**

Recently I saw some Python code which looked something like:

```python
d = {
  None: "value",
  "another_key": "another_value",
}
```

It had never really occurred to me you could use `None` (null) as a key to a dictionary before.
What this also meant is that `None` must be hashable as only hashable objects can be keys in a dictionary.
These objects include `strings`, `tuples`, `sets` but don't include `lists` as they are mutable and not
hashable.

{{< admonition type="tip" title="Lists as keys?" details="true" >}}
Using a list as a key won't provide a consistent hash therefore you wouldn't be able
to find the value associated with that list. Again this is because lists are mutable
so their hash would change.

```python
In [1]: a = ["a", 1, 2, 3]

In [2]: hash(a)
---------------------------------------------------------------
TypeError                     Traceback (most recent call last)
Cell In [2], line 1
----> 1 hash(a)

TypeError: unhashable type: 'list'
```

In fact for this very reason you cannot even hash them using the builtin `hash` function in python.
{{< /admonition >}}

## Hash?

If we do try to use the built-in `hash` function on `None` you will notice we do get a hash (int) as expected.

```python
In [1]: hash(None)
Out[1]: 8783956518372
```

> So yeah you can use `None` as a key in a dictionary.

{{< admonition type="warning" title="JSON Caveat" details="true" >}}
One thing to note is when transforming a dictionary into JSON. The `None` will become a string.
So when you convert it back from JSON to a python dictionary it will be something like:

```python
d = {
  "None": "value",
  # ...
}
```
{{< /admonition >}}