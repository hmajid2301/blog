---
title: {{ replace .Name "-" " " | title }}
date: {{ dateFormat "1995-01-23" .Date }}
canonicalUrl: {{ site.BaseURL }}talks/{{ title }}/
ShowToc: false
ShowReadingTime: false
ShowWordCount: false
hideMeta: false
draft: true
---