---
title: "[{{ replace .File.Dir "content/posts/ctf/" "" | upper }}] {{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
categories: ["CTF"]
tags: ["pwn"]
description: ""
draft: true
---

## 문제 정보

- **대회**:
- **카테고리**: pwn / rev / forensics / web
- **문제명**: {{ replace .File.ContentBaseName "-" " " | title }}
- **점수**:

## 분석

### 파일 확인

```bash
file ./chall
checksec ./chall
```

### 취약점

## 익스플로잇

```python
from pwn import *

# p = process('./chall')
p = remote('', )

# 페이로드 작성

p.interactive()
```

## 플래그

`FLAG{}`
