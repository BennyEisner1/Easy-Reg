function findMaxWeightedSchedule(courses, isRandomized = false) {
  let timeSlots = [];
  let courseArray = Object.values(courses);

  for (let i = 0; i < courseArray.length; i++) {
    const course = courseArray[i];
    const courseTimes = course.times
      .map((time) => {
        const days = time.day.split(",").map((day) => day.trim());
        return days.map((day) => ({
          courseIndex: i,
          start: time.start_time,
          end: time.end_time,
          day: day,
        }));
      })
      .flat();
    timeSlots.push(courseTimes);
  }

  if (isRandomized) {
    timeSlots = shuffleArray(timeSlots);
  }

  timeSlots.sort((a, b) => b.length - a.length);

  const schedule = [];
  const usedCourseIndices = new Set();

  for (const courseSessions of timeSlots) {
    if (canAddCourse(schedule, courseSessions)) {
      schedule.push(...courseSessions);
      usedCourseIndices.add(courseSessions[0].courseIndex);
    }
  }

  schedule.sort((a, b) => {
    if (a.day !== b.day) {
      return getDayValue(a.day) - getDayValue(b.day);
    }
    return a.start - b.start;
  });

  return { schedule, maxWeight: usedCourseIndices.size };
}

function canAddCourse(schedule, courseSessions) {
  return courseSessions.every((session) => !hasConflict(schedule, session));
}

function hasConflict(schedule, newSlot) {
  return schedule.some(
    (slot) =>
      slot.day === newSlot.day &&
      ((newSlot.start >= slot.start && newSlot.start < slot.end) ||
        (newSlot.end > slot.start && newSlot.end <= slot.end) ||
        (newSlot.start <= slot.start && newSlot.end >= slot.end))
  );
}

function getDayValue(day) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return days.indexOf(day);
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

module.exports = findMaxWeightedSchedule;
