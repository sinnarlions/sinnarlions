import { Member, Celebration } from "@/types/member";

export function getTodayCelebrations(
  members: Member[]
): Celebration[] {
  const today = new Date();

  const day = today.getDate();
  const month = today.getMonth() + 1;

  const celebrations: Celebration[] = [];

  members.forEach((member) => {
    // Birthday
    if (member.dob) {
      const [d, m] = member.dob
        .split(".")
        .map(Number);

      if (d === day && m === month) {
        celebrations.push({
          type: "Birthday",
          emoji: "🎂",
          name: member.name,
          date: member.dob,
        });
      }
    }

    // Anniversary
    if (
      member.anniversary &&
      member.spouseName
    ) {
      const [d, m] =
        member.anniversary
          .split(".")
          .map(Number);

      if (d === day && m === month) {
        celebrations.push({
          type: "Anniversary",
          emoji: "💍",
          name: `${member.name} ❤️ ${member.spouseName}`,
          date: member.anniversary,
        });
      }
    }
  });

  return celebrations.sort((a, b) => {
    const priority = {
      Anniversary: 1,
      Birthday: 2,
    };

    return (
      priority[a.type] -
      priority[b.type]
    );
  });
}

export function getUpcomingCelebrations(
  members: Member[]
): Celebration[] {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const upcoming: Celebration[] = [];

  members.forEach((member) => {
    // Birthday
    if (member.dob) {
      const [d, m] = member.dob
        .split(".")
        .map(Number);

      const eventDate = new Date(
        today.getFullYear(),
        m - 1,
        d
      );

      eventDate.setHours(
        0,
        0,
        0,
        0
      );

      if (eventDate > today) {
        upcoming.push({
          type: "Birthday",
          emoji: "🎂",
          name: member.name,
          date: member.dob,
        });
      }
    }

    // Anniversary
    if (
      member.anniversary &&
      member.spouseName
    ) {
      const [d, m] =
        member.anniversary
          .split(".")
          .map(Number);

      const eventDate = new Date(
        today.getFullYear(),
        m - 1,
        d
      );

      eventDate.setHours(
        0,
        0,
        0,
        0
      );

      if (eventDate > today) {
        upcoming.push({
          type: "Anniversary",
          emoji: "💍",
          name: `${member.name} ❤️ ${member.spouseName}`,
          date: member.anniversary,
        });
      }
    }
  });

  return upcoming.sort((a, b) => {
    const [ad, am] =
      a.date.split(".").map(Number);

    const [bd, bm] =
      b.date.split(".").map(Number);

    const aDate = new Date(
      today.getFullYear(),
      am - 1,
      ad
    );

    const bDate = new Date(
      today.getFullYear(),
      bm - 1,
      bd
    );

    return (
      aDate.getTime() -
      bDate.getTime()
    );
  });
}