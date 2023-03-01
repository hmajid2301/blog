---
title: {{ slicestr (replace .Name "-" " ") 11 | title }}
date: {{ dateFormat "2006-01-02" .Date }}
canonicalUrl: https://haseebmajid.dev/posts/{{.Name}}
tags: []
---