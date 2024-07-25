function findMaxWeightedSchedule(courses) {
  let timeSlots = [];
  for (let i = 0; i < courses.length; i++) {
      for (let slot of courses[i].times) {
          timeSlots.push({
              courseIndex: i,
              start: slot.start_time,
              end: slot.end_time,
              day: slot.day
          });
      }
  }

  timeSlots.sort((a, b) => a.end - b.end);

  const n = timeSlots.length;
  const dp = new Array(n).fill(0);
  const prevIndex = new Array(n).fill(-1);

  dp[0] = 1; // Unweighted problem, just count intervals

  const endTimes = timeSlots.map((slot) => slot.end);

  for (let i = 1; i < n; i++) {
      let start = 0;
      let end = i - 1;
      let j = -1;

      while (start <= end) {
          const mid = Math.floor((start + end) / 2);
          if (endTimes[mid] <= timeSlots[i].start) {
              j = mid;
              start = mid + 1;
          } else {
              end = mid - 1;
          }
      }

      let currentWeight = 1;
      if (j !== -1) {
          currentWeight += dp[j];
      }

      if (dp[i - 1] < currentWeight) {
          dp[i] = currentWeight;
          prevIndex[i] = j;
      } else {
          dp[i] = dp[i - 1];
          prevIndex[i] = prevIndex[i - 1];
      }
  }

  const maxWeight = Math.max(...dp);
  let index = dp.indexOf(maxWeight);
  const schedule = [];

  while (index !== -1) {
      schedule.push(timeSlots[index]);
      index = prevIndex[index];
  }

  schedule.reverse();

  return { schedule, maxWeight };
}

module.exports = findMaxWeightedSchedule;
