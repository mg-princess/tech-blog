---
title: "[백준 1753] 최단경로 - 다익스트라"
date: 2024-01-28
categories: ["Algorithm"]
tags: ["백준", "다익스트라", "최단경로", "Python"]
description: "백준 1753번 최단경로 다익스트라 풀이"
draft: false
---

## 문제

[백준 1753 - 최단경로](https://www.acmicpc.net/problem/1753)

## 풀이

```python
import heapq
import sys
input = sys.stdin.readline
INF = float('inf')

V, E = map(int, input().split())
K = int(input())

graph = [[] for _ in range(V + 1)]
for _ in range(E):
    u, v, w = map(int, input().split())
    graph[u].append((v, w))

dist = [INF] * (V + 1)
dist[K] = 0
pq = [(0, K)]

while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]:
        continue
    for v, w in graph[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heapq.heappush(pq, (dist[v], v))

for i in range(1, V + 1):
    print(dist[i] if dist[i] != INF else "INF")
```

## 시간복잡도

`O((V + E) log V)`
