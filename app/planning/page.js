// "use client";

// import { useState } from "react";
// import useSWR from "swr";
// import { Loader } from "@/components/ui/loader";
// // import Header from "@/components/layout/Header";
// import { Activity } from "lucide-react";
// import JobView from "@/components/shared/JobView";

// const fetcher = (url) => fetch(url).then((res) => res.json());

// export default function PlanningPage() {
//   const [selectedJobType, setSelectedJobType] = useState("link_build");

//   // Fetch link build jobs
//   const {
//     data: linkBuildJobs = [],
//     error: linkBuildError,
//     isLoading: linkBuildLoading,
//     mutate: mutateLinkBuild,
//   } = useSWR("/api/bff/link-build", fetcher);

//   const loading = linkBuildLoading;

//   if (loading) {
//     return <Loader variant="bars" text="Loading planning data..." />;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
//       {/* <Header
//         title="Planning & Link Build"
//         subtitle="Manage all link build projects"
//         logo={{
//           src: null,
//           alt: "Planning",
//           fallbackIcon: Activity,
//         }}
//       /> */}

//       <div className="p-6">
//         <JobView
//           jobType="link_build"
//           jobs={linkBuildJobs}
//           mutate={mutateLinkBuild}
//           clientName={null}
//         />
//       </div>
//     </div>
//   );
// }
