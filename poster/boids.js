/**
 * These functions pulled from https://p5js.org/examples/classes-and-objects-flocking/
 */


function separate(currentBoid, boids) {
    let desiredSeparation = 50.0;
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

