import Image from "next/image";
import React from "react";
import logo from "@/public/logo.svg";

export default function Header() {
  return (
    <div className="header bg-[#1492c8] py-2.5">
      <div className="container mx-auto px-20">
        <Image src={logo} width={150} height={150} alt="Logo" />
      </div>
    </div>
  );
}
