---
title: {{ replace .Name "-" " " | title }}
date: {{ dateFormat "1995-01-23" .Date }}
canonicalUrl: {{ site.BaseURL }}posts/{{ replace .Name "-" " " | title }}/
draft: true
tags: 
	- 
---