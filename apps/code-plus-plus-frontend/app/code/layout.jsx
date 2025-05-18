"use client"
import Header from "@/components/Header";
import SubHeader from "@/components/SubHeader";

export default function CodeLayout({
  children,
}) {

    return (
      <div>
        <Header />
        <SubHeader />
        {children}
      </div>
    )
}