# Adaptive search -- All-interval series problem

Here the adaptive search is implemented to solve the [All-interval series problem](http://www.csplib.org/Problems/prob007/).
The script uses some ECMAScript 6 features.

## Adaptive search algorithm's general form
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
  v(i)        | the i-th variable
  argmin(x)(g(x), conditions) | function that returns the x that minimises g and that fits the conditions
  e1 U e2  | union of e1 and e2

### Algorithm

**Repeat** maxRestart times  
  &nbsp;&nbsp; s <- random configuration  
  &nbsp;&nbsp; tabuList <- null  
  &nbsp;&nbsp; **while** (f(s) > 0) **and** (maxIter not reached) **do**  
  &nbsp;&nbsp;&nbsp;&nbsp; S <- {i in {1..n}, i not in tabuList}  
  &nbsp;&nbsp;&nbsp;&nbsp; iMove <- argmax(i)(f(i)(s), i in S)  
  &nbsp;&nbsp;&nbsp;&nbsp; valMove <- argmin(val)(f(s[v(iMove) <- val]))  
  &nbsp;&nbsp;&nbsp;&nbsp; **if** f(s[v(iMove) <- valMove]) < f(s) **then**  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; v(iMove) <- valMove  
  &nbsp;&nbsp;&nbsp;&nbsp; **else**  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tabuList <- iMove U tabuList  
  &nbsp;&nbsp;&nbsp;&nbsp; **end if**  
  &nbsp;&nbsp;&nbsp;&nbsp; tabuList <- update(tabuList)  
  &nbsp;&nbsp; **end while**
