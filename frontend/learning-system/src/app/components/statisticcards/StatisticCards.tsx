"use client";

import { useEffect } from "react";

export const StatisticCards = () => {
  useEffect(() => {
    const listDataCount = document.querySelectorAll("[data-count]");
    if (listDataCount.length > 0) {
      const speed = 200;

      const countUp = (element: Element) => {
        const target = +element.getAttribute("data-count")!;
        const increment = Math.ceil(target / speed);
        let count = 0;

        const updateCount = () => {
          count += increment;
          if (count >= target) {
            element.textContent = target >= 1000 ? Math.floor(target / 1000) + " k+" : target + "+";
          } else {
            element.textContent = target >= 1000 ? Math.floor(count / 1000) + " k+" : count + "+";
            requestAnimationFrame(updateCount);
          }
        };
        updateCount();
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      });

      listDataCount.forEach((dataCount) => observer.observe(dataCount));
    }
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-8 p-20 container mx-auto">
      <div className="bg-[#F7F7F7] rounded-xl shadow-md p-16 w-[250px] text-center">
        <div className="text-[#FF782D] text-4xl font-bold">
          <span data-count="103000">0</span>
        </div>
        <div className="text-[#333333] text-lg font-semibold mt-2">Active Students</div>
      </div>
      <div className="bg-[#F7F7F7] rounded-xl shadow-md p-16 w-[250px] text-center">
        <div className="text-[#FF782D] text-4xl font-bold">
          <span data-count="33000">0</span>
        </div>
        <div className="text-[#333333] text-lg font-semibold mt-2">Total Courses</div>
      </div>
      <div className="bg-[#F7F7F7] rounded-xl shadow-md p-16 w-[250px] text-center">
        <div className="text-[#FF782D] text-4xl font-bold">
          <span data-count="11000">0</span>
        </div>
        <div className="text-[#333333] text-lg font-semibold mt-2">Instructors</div>
      </div>
      <div className="bg-[#F7F7F7] rounded-xl shadow-md p-16 w-[250px] text-center">
        <div className="text-[#FF782D] text-4xl font-bold">
          <span data-count="100">0</span>
        </div>
        <div className="text-[#333333] text-lg font-semibold mt-2">Satisfaction Rate</div>
      </div>
    </div>
  );
};
