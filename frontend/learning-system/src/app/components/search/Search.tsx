"use client"

import { useRouter, useSearchParams } from "next/navigation";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaMagnifyingGlass } from "react-icons/fa6";

export const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (event: any) => {
    event.preventDefault();
    const keyword = event.target.keyword.value;
    router.push(`/search?keyword=${keyword}`);
  }

  const defaultKeyword = searchParams.get("keyword") || "";

  return (
    <>
      <form 
        className="bg-[#212121] rounded-[50px] mt-[20px] sticky top-[20px] left-[20px] z-[999] py-[15px] px-[30px] flex items-center"
        onSubmit={handleSearch}
      >
        <input
          type="text" 
          name="keyword" 
          placeholder="Tìm kiếm..."
          className="order-2 text-[16px] font-[500] text-white bg-transparent outline-none flex-1"
          defaultValue={defaultKeyword}
        />
        <button 
          type="submit"
          className="order-1 text-[22px] text-white mr-[20px]"
        >
          <FaMagnifyingGlass />
        </button>
      </form>
    </>
  )
}