import Link from "next/link";
import { usePathname } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const MenuItem = (props: any) => {
  const { item, isLogin } = props;

  const pathname = usePathname();

  return (
    <>
      {(item.isLogin === undefined || item.isLogin === isLogin) && (
        <li className="mb-[30px]">
          <Link 
            href={item.link} 
            className={"flex items-center hover:text-[#00ADEF] " + (pathname === item.link ? "text-[#00ADEF]" : "text-white")}
          >
            <span className="text-[20px] mr-[20px]">
              {item.icon}
            </span>
            <span className="text-[16px] font-[700]">
              {item.title}
            </span>
          </Link>
        </li>
      )}
    </>
  )
}