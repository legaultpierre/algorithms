# Tabu search -- N-Queens problem

Here the tabu search is implemented to solve the [N-Queens problem](https://en.wikipedia.org/wiki/Eight_queens_puzzle).
The script uses some ECMAScript 6 features.

## Tabu search algorithm's general form
Based on [Charlotte Truchet](http://www.normalesup.org/~truchet/)'s course.

### Parameters
  - maxRestart: the maximal number of restarts
  - maxIter:    the maximal number of localsearch iterations.

### Notations
  Notation | Meaning
  -------- | -------
  s        | a configuration
  tabuList | the tabu list
  f        | the cost function
  V        | a neighborhood
  argmin(g(x), conditions) | function that returns the x that minimises g and that fits the conditions
  e1 U e2  | union of e1 and e2

### Algorithm

**Repeat** maxRestart times  
  &nbsp;&nbsp; s <- random configuration  
  &nbsp;&nbsp; tabuList <- null  
  &nbsp;&nbsp; **while** (f(s) > 0) **and** (maxIter not reached) **do**  
  &nbsp;&nbsp;&nbsp;&nbsp; V <- neighborhood(s)  
  &nbsp;&nbsp;&nbsp;&nbsp; s <- argmin(f(x), x in V **and** x not in tabuList)  
  &nbsp;&nbsp;&nbsp;&nbsp; tabuList <- (s) U update(tabuList)  
  &nbsp;&nbsp; **end while**
