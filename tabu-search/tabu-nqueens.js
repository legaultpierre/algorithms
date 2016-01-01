/**
 * N queens problem
 * The configuration is given by each queen's line on the chessboard.
 */

// Number of queens
var n = 10;
var tabuSize = 8;

// Objective function
var cost = -1;
// Number of iterations
var itMax = 10000;
// Number of restarts
var maxRestart = 1000;
//number of tentatives to find a new neig
var maxTentativeNeighbor = 10;

//Stores the number of iterations
var iterations = [];
// Stores the number of restarts
var restarts = [];

console.log(measure(10));

/*
 * ==============================================================
 * ====================== Algorithm's core ======================
 * ==============================================================
 */

/*
 * Measures the time of a repeatNumber launches of the algorithm.
 * Calculates the average duration over the repeatNumber launches.
 */
function measure(repeatNumber) {
  var average = 0;

  // Here we launch a repeatNumber of times the algorithm
  var d = getDelays(repeatNumber);

  // Then we calculate the average of duration
  d.forEach(function(e) {
    average += e;
  });
  average = average/repeatNumber;

  return {
    delays: d,
    average: average,
    iterations: iterations,
    restarts: restarts
  }
}

/**
 * Gets the duration of repeatNumber launches of the algorithm.
 */
function getDelays(repeatNumber) {
  var delays = [];
  var lines;

  for(var i = 0; i < repeatNumber; i++) {
    lines = {};
    var start = new Date().getTime();
    run(lines);
    var end = new Date().getTime();
    delays.push(end - start);
  }

  return delays;
}

/*
 * Runs the algorithm and stores it solution into the "lines" object
 */
function run(lines) {
  lines = restart(n, maxRestart);
}

/*
 * Restarts the algorithm a maxRestart times for a n*n chessboard
 */
function restart(n, maxRestart) {
  var cost = -1;

  for (var i = 0; i < maxRestart && cost !== 0; i++) {
    // Generates a random configuration for a n*n configuration
    configuration = generateRandomConfig(n);

    // Apply the algorithm to the random configuration with a max of itMax
    // iterations
    configuration = runIterations(configuration, [], itMax);

    // The cost of the result is calculted
    cost = calculateCost(configuration);

    if (cost === 0) {
      restarts.push(i);
    }
  }

  return configuration;
}

/*
 * Run the algorithm a max of itMax iterations
 */
function runIterations(configuration, tabuList, itMax) {
  var cost = -1;

  for (var i=0; i < itMax && cost !== 0; i++) {
    // Apply one iteration of the algorithm to the current configuration
    configuration = oneIteration(configuration, tabuList);
    // Calculate the cost of the result
    cost = calculateCost(configuration);

    if (cost === 0) {
      iterations.push(i+1);
    }
  }

  return configuration;
}

/*
 * Generates a random configuration for a n*n chessboard.
 * For every column there is a line position for a queen.
 */
function generateRandomConfig(n) {
  var object = {};
  var listOfNonUsed = [];

  for (var i = 0; i < n; i++) {
    listOfNonUsed.push(i);
  }

  for (var i=0; i < n; i++) {
    var index = Math.floor((Math.random() * listOfNonUsed.length));
    var element = listOfNonUsed.splice(index,1)[0];
    object[i] = element;
  }

  return object;
}

/*
 * Applies an iteration of the algorithm to the given configuration
 */
function oneIteration(configuration, tabu) {
  var j = 0;

  // Generate a neighborhood, removing all the tabu configs
  // The number of iterations to find a accepted neighbors is limited
  var v = removeTabuConfigs(generateNeighbors(configuration), tabu);
  while (v.length<1 && j<maxTentativeNeighbor) {
    v = removeTabuConfigs(generateNeighbors(configuration), tabu);
    j++;
  }
  if (j === maxTentativeNeighbor) {
    console.log("MAX NEIGHBOR")
    return configuration;
  }

  //Calculate the cost of each neighbor
  var vCosts = v.map(function(neigh) {
    return calculateCost(neigh);
  });

  // Gets the best solution that minimises the cost function
  var best = vCosts.indexOf(Math.min(...vCosts));

  // Updates the tabu list
  tabu.push(v[best]);
  updateTabuList(tabu, tabu.length>tabuSize);

  // Updates the cost
  cost = vCosts[best];

  // Updates the configuration
  configuration = cloneObject(v[best]);

  return configuration;
}

/*
 * Generates all the neighbors from a configuration
 * Here, a random queen is chosen, and the neighborhood is composed by all the
 * configurations obtained by changing this queen's position.
 */
function generateNeighbors(configuration) {
  var listOfNeighbors = [];

  //Takes a random queen
  var randomQueen = Math.floor((Math.random() * getConfigurationSize(configuration)));
  var queenPositionLine = configuration[randomQueen];

  // Determine the possible configurations by moving this queen
  var possibleConfigurations = determinePossibleLines(configuration,
                                                      queenPositionLine)
    .map(function(l) {
      var clone = cloneObject(configuration);
      clone[randomQueen] = l;
      return clone;
    });

  return possibleConfigurations;
}

/*
 * Evaluates the cost function for a given configuration.
 * Here the cost function is the sum of conflicts for each queen.
 */
function calculateCost(configuration) {
  var cost = 0;
  var configurationSize = getConfigurationSize(configuration);
  //Number of collisions
  for (var i = 0; i < configurationSize; i++) {

    for (var j = i+1; j < configurationSize; j++ ) {

      //Horizontal conflict
      if (configuration[i] === configuration[j]) {
        cost += 1;
      }
      //Desc diagonal conflict
      if ((j-i) === (configuration[j] - configuration[i])) {
        cost +=1;
      }
      //Asc diagonal conflict
      else if ((j-i) === (configuration[i] - configuration[j])) {
        cost +=1;
      }

    }
  }

  return cost;
}


/*
 * ===================================================
 * ====================== Utils ======================
 * ===================================================
 */

/*
 * Gets the size of a configuration
 */
function getConfigurationSize(configuration) {
  return Object.keys(configuration).length;
}


/*
 * Removes all the tabu configurations from a list of configurations
 */
function removeTabuConfigs(listOfConfigs, tabu) {
  var i = 0;
  while (i < listOfConfigs.length) {
    var conf = listOfConfigs[i];
    if (isInTabu(conf, tabu)) {
      listOfConfigs.splice(i, 1);
    }
    else {
      i++;
    }
  }
  return listOfConfigs;
}

/*
 * Clones a object
 */
function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
      temp[key] = cloneObject(obj[key]);
    }

    return temp;
}

/*
 * Tests if 2 configs are the same
 */
function sameConfig(config1, config2) {
  var keys1 = Object.keys(config1);
  var same = true;
  for (var i = 0; i < keys1.length && same; i++) {
    var k = keys1[i];
    if (config1[k] !== config2[k]) {
      same = false;
    }
  }
  return same;
}

/*
 * Updates the tabu list, removing the first pushed element
 */
function updateTabuList(list, condition) {
  if (condition) {
    list.splice(0,1);
  }
}

/*
 * Tests if a config is in the tabu list
 */
function isInTabu(conf, tabu) {
  var found = false;
  for (var i=0; i < tabu.length && !found; i++) {
    if (sameConfig(tabu[i], conf)) {
      found = true;
    }
  }
  return found;
}

/*
 * Determines the possible lines for a given queen
 */
function determinePossibleLines(configuration, line) {
  var size = getConfigurationSize(configuration);

  var listOfNonUsed = [];
  for (var i = 0; i < size; i++) {
    if (i !== line) {
      listOfNonUsed.push(i);
    }
  }
  return listOfNonUsed;
}
