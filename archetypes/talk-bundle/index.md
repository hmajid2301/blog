---
title: {{ replace .Name "-" " " | title }}
date: {{ dateFormat "2006-01-02" .Date }}
canonicalUrl: {{ site.BaseURL }}talks/{{ title }}/
ShowToc: false
ShowReadingTime: false
ShowWordCount: false
hideMeta: false
draft: true
---