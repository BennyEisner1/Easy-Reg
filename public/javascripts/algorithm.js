function findMaxWeightedSchedule(courses) {
    let timeSlots = [];
    let courseArray = Object.values(courses);
    for (let i = 0; i < courseArray.length; i++) {
        for (let slot of courseArray[i].times) {
            const days = slot.day.split(',').map(day => day.trim());
            days.forEach(day => {
                timeSlots.push({
                    courseIndex: i,
                    start: slot.start_time,
                    end: slot.end_time,
                    day: day
                });
            });
        }
    }

    // Sort time slots by day, then by end time
    timeSlots.sort((a, b) => {
        if (a.day !== b.day) {
            return getDayValue(a.day) - getDayValue(b.day);
        }
        return a.end - b.end;
    });

    const n = timeSlots.length;
    const dp = new Array(n).fill(0);
    const prevIndex = new Array(n).fill(-1);

    for (let i = 0; i < n; i++) {
        dp[i] = 1;
        for (let j = 0; j < i; j++) {
            if (isCompatible(timeSlots[j], timeSlots[i]) && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                prevIndex[i] = j;
            }
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

function isCompatible(slot1, slot2) {
    if (slot1.day !== slot2.day) return true;
    return slot1.end <= slot2.start;
}

function getDayValue(day) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return days.indexOf(day);
}

module.exports = findMaxWeightedSchedule;