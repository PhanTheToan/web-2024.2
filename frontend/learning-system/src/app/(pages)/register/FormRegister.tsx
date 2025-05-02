/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

export const FormRegister = () => {

  return (
    <>
      <form className="">
        <div className="mb-[15px]">
          <label 
            className="block mb-[5px] font-[600] text-[14px]" 
            htmlFor="fullName"
          >
            <span className="text-[#333333]">Họ Tên</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input 
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Ví dụ: Le Van A"
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required={true}
          />
        </div>
        <div className="mb-[15px]">
          <label 
            className="block mb-[5px] font-[600] text-[14px]" 
            htmlFor="email"
          >
            <span className="text-[#333333]">Email</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input 
            type="email"
            name="email"
            id="email"
            placeholder="Ví dụ: levana@gmail.com"
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required={true}
          />
        </div>
        <div className="mb-[15px]">
          <label 
            className="block mb-[5px] font-[600] text-[14px]" 
            htmlFor="password"
          >
            <span className="text-[#333333]">Mật Khẩu</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input 
            type="password"
            name="password"
            id="password"
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required={true}
          />
        </div>
        <button
          type="submit"
          className="h-[50px] w-full bg-[#FF782D] text-[#333333] rounded-[6px] font-[600] text-[16px]"
        >
          Đăng Ký
        </button>
      </form>
    </>
  )
}