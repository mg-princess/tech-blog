---
title: "[DreamHack] {{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
categories: ["Wargame"]
tags: ["pwn", "DreamHack"]
description: ""
draft: true
---

## 문제 정보

- **플랫폼**: DreamHack / HTB / Webhacking.kr / 247CTF
- **카테고리**:
- **문제명**: {{ replace .File.ContentBaseName "-" " " | title }}
- **난이도**:

## 분석

### 보호 기법

```bash
checksec ./
```

### 소스 분석

```c

```

### 취약점

## 익스플로잇

```python
from pwn import *

# p = process('./')
p = remote('', )

p.interactive()
```

## 참고
