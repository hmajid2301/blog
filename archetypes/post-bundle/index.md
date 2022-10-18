---
title: {{ replace .Name "-" " " | title }}
date: {{ dateFormat "1995-01-23" .Date }}
canonical_url: {{ site.BaseURL }}posts/{{ title }}/
draft: true
tags: 
	- 
---