/**
 * All-interval series problem
 */

// Size of the problem
var n = 8;
var tabuSize = 5;

// Objective function
var cost = -1;
// Number of iterations
var itMax = 300;
// Number of restarts
var maxRestart = 1000;

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
    average: average
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
    lines = run(lines);
    var end = new Date().getTime();
    console.log(lines);
    delays.push(end - start);
  }

  return delays;
}

/*
 * Runs the algorithm and stores it solution into the "lines" object
 */
function run(lines) {
  return restart(n, maxRestart);
}

/*
 * Restarts the algorithm a maxRestart times for a n*n chessboard
 */
function restart(n, maxRestart) {
  var cost = -1;

  for (var i = 0; i < maxRestart && cost !== 0; i++) {
    // Generates a random configuration for a n-sized configuration
    configuration = generateRandomConfig(n);

    // Apply the algorithm to the random configuration with a max of itMax
    // iterations
    configuration = runIterations(configuration, [], itMax);

    // The cost of the result is calculted
    cost = calculateCost(configuration);
    if (cost === 0) {
      console.log('RESTARTS: ' + i + ' i.e.' + (i * itMax) + ' iterations');
    }
  }

  if (cost !== 0) {
    console.log("WRONG!!")
  }
  return configuration;
}

/*
 * Run the algorithm a max of itMax iterations
 */
function runIterations(configuration, tabuList, itMax) {
  var cost = calculateCost(configuration);
  var configSize = getConfigurationSize(configuration);
  var s, iMove = -1, valMove = Infinity, fiCosts, thrownTabu = -1, oldValue;

  for (var i = 0; i < itMax && cost !== 0; i++) {

    // Creates the complementary of the tabu list
    s = complementaryTabu(tabuList);

    // Calculates the f(i)(configuration) for each i in s
    fiCosts = calculateComposantCost(configuration, s);

    /*=======================TRY TO IMPROVE CALCULATE ========================*/
    // if (iMove === -1) {
    //   fiCosts = calculateComposantCost(configuration, s);
    // }
    // else {
    //   fiCosts = calculateComposantCostAlt(configuration, s, iMove, oldValue, thrownTabu, fiCosts);
    // }
    /*============================ END OF TRY ================================*/

    // Gets the index iMove of the variable that maximises its cost function
    var maxFiCost = Math.max(...fiCosts),
        fittingIndex = [];
    fiCosts.forEach(function(e, index) {
      if (maxFiCost === e){
        fittingIndex.push(index);
      }
    });
    iMove = s[fittingIndex[Math.floor((Math.random() * fittingIndex.length))]];

    // Gets the value to give to the iMove variable
    var valsiMove = determinePossibleValues(configuration,
                                             configuration[iMove]);
    var costsiMove = valsiMove.map(function(e) {
      var clone = cloneObject(configuration);
      clone[iMove] = e;
      return calculateCost(clone);
    });

    valMove = valsiMove[costsiMove.indexOf(Math.min(...costsiMove))];

    // Assigns the valMove value to the iMove variable
    var clone = cloneObject(configuration);
    oldValue = configuration[iMove];
    clone[iMove] = valMove;

    // If it improves the cost, it is kept
    if (calculateCost(clone) < cost) {
      configuration = clone;

      // Calculate the cost of the result
      cost = calculateCost(configuration);
    }
    // Else, the variable is put in the tabu list
    else {
      tabuList.push(iMove);
    }
    // The tabu list is updated
    thrownTabu = updateTabuList(tabuList, tabuList.length > tabuSize);

    if (cost === 0) {
      console.log('IT in', i);
    }
  }

  return configuration;
}

/*
 * Generates a random configuration n-sized problem.
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
 * Evaluates the cost function for a given configuration.
 */
function calculateCost(configuration) {
  var cost = 0;
  var configurationSize = getConfigurationSize(configuration);
  var alreadyIn = [],
      alreadyNumbers = [];
  //Number of collisions
  for (var i = 0; i < configurationSize - 1; i++) {
    var difference = Math.abs(configuration[i] - configuration[i+1]);

    // Checks the unicity constraint
    if (alreadyNumbers.indexOf(configuration[i]) !== -1) {
      cost++;
    }
    else {
      alreadyNumbers.push(configuration[i]);
    }

    // Checks the diffence constraint
    if (alreadyIn.indexOf(difference) !== -1) {
      cost++;
    }
    else {
      alreadyIn.push(difference)
    }
  }
  if (alreadyNumbers.indexOf(configuration[configurationSize - 1]) !== -1) {
    cost++;
  }

  return cost;
}

/*
 * Evaluates the cost function for each variable, for a given configuration.
 */
function calculateComposantCost(configuration, s) {
  var size = s.length;
  var configurationSize = getConfigurationSize(configuration);
  var cost = {};
  var index = 0;
  var alreadyIn = [],
      alreadyNumbers = [];

  s.forEach(function(e) {
    cost[e] = 0;
  });

  //Number of collisions
  for (var i = 0; i < configurationSize - 1; i++) {
    // Stores the difference
    var difference = Math.abs(configuration[i] - configuration[i+1]);
    
    // Checks the unicity constraint
    var alreadyNumberIt = alreadyNumbers.indexOf(configuration[i]);
    if (alreadyNumberIt !== -1) {
      if (s.indexOf(i) !== -1) {
        cost[i]++;
      }
      if (s.indexOf(alreadyNumberIt) !== -1) {
        cost[alreadyNumberIt] = cost[alreadyNumberIt] === undefined ? 1 : cost[alreadyNumberIt] + 1;
      }
    }
    else {
      alreadyNumbers.push(configuration[i]);
    }

    // Checks the difference constraint
    var alreadyInIt = alreadyIn.indexOf(difference);
    if (alreadyInIt !== -1) {
      if (s.indexOf(i) !== -1) {
        cost[i]++;
      }
      if (s.indexOf(i + 1) !== -1) {
        cost[i + 1]++;
      }
      if (s.indexOf(alreadyInIt) !== -1) {
        cost[alreadyInIt]++;
      }
      if (s.indexOf(alreadyInIt + 1) !== -1) {
        cost[alreadyInIt + 1]++;
      }
    }
    else {
      alreadyIn.push(difference)
    }
  }
  var alreadyNumberIt = alreadyNumbers.indexOf(configuration[configurationSize - 1]);
  if (alreadyNumberIt !== -1) {
    if (s.indexOf(configurationSize - 1) !== -1) {
      cost[configurationSize - 1]++;
    }
    if (s.indexOf(alreadyNumberIt) !== -1) {
      cost[alreadyNumberIt]++;
    }
  }
  return Object.keys(cost).map(function(k) {
    return cost[k];
  });
}

/*
 * Re-evaluate the cost function by composant, only for the one
 * NOT WORKING PROPERLY FOR NOW
 */
function calculateComposantCostAlt(configuration, s, iMoved, oldValue, thrownTabu, ficost){
  var configurationSize = getConfigurationSize(configuration);
  var previousFiCost = ficost;
  
  var counter = 0; 

  // Determine the value changed in config
  var valImoved = configuration[iMoved];

  // Determine the two old and new differences involved by the change
  var old1 = -1, old2 = -1, new1 = -1, new2 = -1;
  if (iMoved > 0 && iMoved < configurationSize-1) {
    new1 = Math.abs(configuration[iMoved-1] - valImoved);
    new2 = Math.abs(configuration[iMoved+1] - valImoved);
    old1 = Math.abs(configuration[iMoved-1] - oldValue);
    old2 = Math.abs(configuration[iMoved+1] - oldValue);
  }
  else if (iMoved === 0) {
    new1 = Math.abs(configuration[iMoved+1] - valImoved);
    old1 = Math.abs(configuration[iMoved+1] - oldValue);
  }
  else {
    new1 = Math.abs(configuration[iMoved-1] - valImoved);
    old1 = Math.abs(configuration[iMoved-1] - oldValue);
  }


  // Test if any unicity break
  for (var i = 0; i < configurationSize; i++) {
    if (i !== iMoved) {
      var configI = configuration[i];
      var iInS = s.indexOf(i) !== -1;

      // Marks all previous unicity conflicts
      if (configI === oldValue) {
        // counter--;
        if (iInS) {
          previousFiCost[i]--;
        }
      }
      // Marks all new unicity conflicts
      if (configI === valImoved) {
        counter++;
        if (iInS) {
          previousFiCost[i]--;
        }
      }
      // Marks all difference conflicts
      if (i < configurationSize-1) {
        //We do not need to consider here the conflicts with iMoved
        if (i+1 !== iMoved) {
          var diff = Math.abs(configuration[i] - configuration[i+1]);
          if (diff === old1 || diff === old2) {
            // counter--;
            if (iInS) {
              previousFiCost[i]--;
            }
            if (s.indexOf(i+1) !== -1) {
              previousFiCost[i+1]--;
            }
          }
          if (diff === new1 || diff === new2) {
            counter++;
            if (iInS) {
              previousFiCost[i]++;
            }
            if (s.indexOf(i+1) !== -1) {
              previousFiCost[i+1]++;
            }
          }
        }
      }
    }
  }
  // If an element is removed from tabu
  if (thrownTabu !== -1) {
    delete previousFiCost[thrownTabu];
  }
  previousFiCost[iMoved] = counter;
  return previousFiCost;
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
    return list.splice(0,1)[0];
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
 * Returns the list of int that are not in the tabu list
 */
function complementaryTabu(tabu) {
  var listOfNonUsed = [];

  for (var i = 0; i < n; i++) {
    listOfNonUsed.push(i);
  }

  tabu.forEach(function(e) {
    listOfNonUsed.splice(listOfNonUsed.indexOf(e),1);
  });
  return listOfNonUsed;
}

/*
 * Determines the complementary values from a value
 */
function determinePossibleValues(configuration, value) {
  var size = getConfigurationSize(configuration);

  var listOfNonUsed = [];
  for (var i = 0; i < size; i++) {
    if (i !== value) {
      listOfNonUsed.push(i);
    }
  }
  return listOfNonUsed;
}
