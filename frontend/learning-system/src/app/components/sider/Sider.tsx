"use client"

/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { useEffect, useState } from "react";
import { FaHouse, FaMusic, FaPodcast, FaHeart, FaRightFromBracket, FaUser, FaUserPlus } from "react-icons/fa6";
import { MenuItem } from "./MenuItem";

export const Sider = () => {
  const [isLogin, setIsLogin] = useState<boolean>();

  const menu = [
    {
      icon: <FaHouse />,
      title: "Trang Chủ",
      link: "/"
    },
    {
      icon: <FaMusic />,
      title: "Danh mục bài hát",
      link: "/categories"
    },
    {
      icon: <FaPodcast />,
      title: "Ca sĩ",
      link: "/singers"
    },
    {
      icon: <FaHeart />,
      title: "Bài hát yêu thích",
      link: "/wishlist",
      isLogin: true
    },
    {
      icon: <FaRightFromBracket />,
      title: "Đăng xuất",
      link: "/logout",
      isLogin: true
    },
    {
      icon: <FaUser />,
      title: "Đăng nhập",
      link: "/login",
      isLogin: false
    },
    {
      icon: <FaUserPlus />,
      title: "Đăng ký",
      link: "/register",
      isLogin: false
    }
  ];

  return (
    <>
      <div className="bg-[#212121] h-[100vh] fixed w-[280px]">
        <div className="bg-[#1C1C1C] py-[25px] px-[20px]">
          <Link href="/">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-[42px] w-auto"
            />
          </Link>
        </div>
        <nav className="py-[30px] px-[20px]">
          <ul className="">
            {menu.map((item, index) => (
              <MenuItem item={item} isLogin={isLogin} key={index} />
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}