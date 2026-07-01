import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";

const days = [
  { day: "Mon", value: 60 },
  { day: "Tue", value: 90 },
  { day: "Wed", value: 70 },
  { day: "Thu", value: 100 },
  { day: "Fri", value: 40 },
  { day: "Sat", value: 80 },
  { day: "Sun", value: 55 },
];

export default function WeeklyProgress() {
  return (
    <div>
      <SectionTitle
        title="Weekly Progress"
        subtitle="Workout consistency"
      />

      <Card>
        <div className="flex items-end justify-between h-52">

          {days.map((item) => (

            <div
              key={item.day}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="w-8 rounded-full bg-green-500 transition-all duration-300 hover:bg-green-400"
                style={{
                  height: `${item.value}%`,
                }}
              />

              <span className="text-sm text-zinc-500">
                {item.day}
              </span>
            </div>

          ))}

        </div>
      </Card>
    </div>
  );
}