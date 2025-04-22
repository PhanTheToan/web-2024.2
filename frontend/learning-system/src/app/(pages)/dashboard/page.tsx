"use client";
import { CompletedCourses } from "./completed-courses";
import { CoursesInProgress } from "./courses-in-progress";
import { RecommendedCourses } from "./recommended-courses";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-3 lg:col-span-2">
              <CoursesInProgress />
            </div>
            <div className="col-span-3 lg:col-span-1">
              <RecommendedCourses />
            </div>
            <div className="col-span-3">
              <CompletedCourses />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

