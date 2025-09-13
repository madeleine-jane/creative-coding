/**
 * These functions pulled from https://p5js.org/examples/classes-and-objects-flocking/
 */

function seek(currentBoid, target) {
    // A vector pointing from the location to the target
    let desired = p5.Vector.sub(target, currentBoid.position);

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(currentBoid.maxSpeed);

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, currentBoid.velocity);

    // Limit to maximum steering force
    steer.limit(currentBoid.maxForce);
    return steer;
}

function separate(currentBoid, boids) {
    let desiredSeparation = 30.0;
    let steer = createVector(0, 0);
    let count = 0;

    // For every boid in the system, check if it's too close
    for (let boid of boids) {
        let distanceToNeighbor = p5.Vector.dist(currentBoid.position, boid.position);

        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
            // Calculate vector pointing away from neighbor
            let diff = p5.Vector.sub(currentBoid.position, boid.position);
            diff.normalize();

            // Scale by distance
            diff.div(distanceToNeighbor);
            steer.add(diff);

            // Keep track of how many
            count++;
        }
    }

    // Average -- divide by how many
    if (count > 0) {
        steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
        // Implement Reynolds: Steering = Desired - Velocity
        steer.normalize();
        steer.mult(currentBoid.maxSpeed);
        steer.sub(currentBoid.velocity);
        steer.limit(currentBoid.maxForce);
    }
    return steer;
}


// Alignment
// For every nearby boid in the system, calculate the average velocity
function align(currentBoid, boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = p5.Vector.dist(currentBoid.position, boids[i].position);
        if (d > 0 && d < neighborDistance) {
            sum.add(boids[i].velocity);
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(currentBoid.maxSpeed);
        let steer = p5.Vector.sub(sum, currentBoid.velocity);
        steer.limit(currentBoid.maxForce);
        return steer;
    } else {
        return createVector(0, 0);
    }
}

// Cohesion
// For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
function cohere(currentBoid, boids) {
    let neighborDistance = 20;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = p5.Vector.dist(currentBoid.position, boids[i].position);
        if (d > 0 && d < neighborDistance) {
            sum.add(boids[i].position); // Add location
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        return seek(currentBoid, sum); // Steer towards the location
    } else {
        return createVector(0, 0);
    }
}
