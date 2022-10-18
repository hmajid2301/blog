---
title: {{ replace .Name "-" " " | title }}
date: {{ dateFormat "1995-01-23" .Date }}
canonicalUrl: {{ site.BaseURL }}posts/{{ title }}/
draft: true
tags: 
	- 
---