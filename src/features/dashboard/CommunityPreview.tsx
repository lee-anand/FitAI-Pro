import Card from "../../components/ui/Card";
import SectionTitle from "../../components/ui/SectionTitle";

export default function CommunityPreview() {
  return (
    <div className="mt-8">

      <SectionTitle
        title="Community"
        subtitle="Latest activities"
      />

      <Card>

        <div className="space-y-5">

          <div className="flex justify-between">

            <div>

              <h3 className="font-semibold">
                Rahul
              </h3>

              <p className="text-sm text-zinc-500">
                Completed 150 Push-ups
              </p>

            </div>

            <span className="text-green-500">
              +150 XP
            </span>

          </div>

          <div className="flex justify-between">

            <div>

              <h3 className="font-semibold">
                Priya
              </h3>

              <p className="text-sm text-zinc-500">
                Finished Leg Day
              </p>

            </div>

            <span className="text-green-500">
              +90 XP
            </span>

          </div>

        </div>

      </Card>

    </div>
  );
}