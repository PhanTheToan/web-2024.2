import React, { JSX } from "react";
import Icon from "./Icon";
import { ReviewItem } from "@/app/types";

const checkboxIcon = `<svg id="I1:229;1:1227" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="review-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_270)"> <path d="M12.6667 3.83333V13.1667H3.33333V3.83333H12.6667ZM12.6667 2.5H3.33333C2.6 2.5 2 3.1 2 3.83333V13.1667C2 13.9 2.6 14.5 3.33333 14.5H12.6667C13.4 14.5 14 13.9 14 13.1667V3.83333C14 3.1 13.4 2.5 12.6667 2.5Z" fill="#555555"></path> </g> <defs> <clipPath id="clip0_2221_270"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

const checkedIcon = `<svg id="I1:230;1:1227" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="review-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_583)"> <path d="M12.6667 2.5H3.33333C2.59333 2.5 2 3.1 2 3.83333V13.1667C2 13.9 2.59333 14.5 3.33333 14.5H12.6667C13.4067 14.5 14 13.9 14 13.1667V3.83333C14 3.1 13.4067 2.5 12.6667 2.5ZM6.66667 11.8333L3.33333 8.5L4.27333 7.56L6.66667 9.94667L11.7267 4.88667L12.6667 5.83333L6.66667 11.8333Z" fill="#555555"></path> </g> <defs> <clipPath id="clip0_2221_583"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

const activeStar = `<svg id="I1:229;1:1229" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="star" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_274)"> <path d="M8.00004 12.0134L12.12 14.5L11.0267 9.81337L14.6667 6.66004L9.87337 6.25337L8.00004 1.83337L6.12671 6.25337L1.33337 6.66004L4.97337 9.81337L3.88004 14.5L8.00004 12.0134Z" fill="#F4BF08"></path> </g> <defs> <clipPath id="clip0_2221_274"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

const inactiveStar = `<svg id="I1:230;1:1233" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="star inactive" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_603)"> <path d="M8.00004 12.0134L12.12 14.5L11.0267 9.81337L14.6667 6.66004L9.87337 6.25337L8.00004 1.83337L6.12671 6.25337L1.33337 6.66004L4.97337 9.81337L3.88004 14.5L8.00004 12.0134Z" fill="#9D9D9D"></path> </g> <defs> <clipPath id="clip0_2221_603"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

interface ReviewListProps {
  reviews: ReviewItem[];
  onReviewSelect: (stars: number[]) => void;
  selectedReviews?: number[];
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews, 
  onReviewSelect,
  selectedReviews = []
}) => {
  const renderStars = (count: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          key={i}
          svg={i < count ? activeStar : inactiveStar}
          width={16}
          height={16}
        />
      );
    }
    return stars;
  };

  const handleReviewClick = (stars: number) => {
    let newSelectedReviews: number[];

    if (selectedReviews.includes(stars)) {
      // Remove if already selected
      newSelectedReviews = selectedReviews.filter(rev => rev !== stars);
    } else {
      // Add if not selected
      newSelectedReviews = [...selectedReviews, stars];
    }

    onReviewSelect(newSelectedReviews);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {reviews.map((review, index) => {
        const isSelected = selectedReviews.includes(review.stars);
        return (
          <button
            key={index}
            className="flex gap-1 items-center text-lg text-neutral-600 hover:text-neutral-800 transition-colors"
            onClick={() => handleReviewClick(review.stars)}
          >
            <Icon
              svg={isSelected ? checkedIcon : checkboxIcon}
              width={16}
              height={16}
            />
            <div className="flex flex-1 gap-1">{renderStars(review.stars)}</div>
            <span className="ml-auto">({review.count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReviewList;