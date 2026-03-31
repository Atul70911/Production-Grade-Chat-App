import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export const formatMessageTime = (date: string): string => {
  const d = new Date(date);
  return format(d, "hh:mm a");
};

export const formatChatDate = (date: string): string => {
  const d = new Date(date);

  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return format(d, "EEEE");
  return format(d, "MM/dd/yyyy");
};

export const formatLastSeen = (date: string): string => {
  const d = new Date(date);

  if (isToday(d)) return `last seen today at ${format(d, "hh:mm a")}`;
  if (isYesterday(d)) return `last seen yesterday at ${format(d, "hh:mm a")}`;
  return `last seen ${format(d, "MM/dd/yyyy")}`;
};