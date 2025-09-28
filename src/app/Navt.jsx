"use client";
import React from 'react'
import logo from '../../public/whitelogo.webp'
import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from 'next/link';
import { useMyContext } from "../context/CartContext";

export default function NavT() {
  const { cart } = useMyContext();
  const cartCount = cart.length;

  return (
    <>
    
      <div className="sticky top-0 bg  z-50 p-4">
        <div className=" h-16 flex items-center justify-between text-2xl font-bold text  ">
          <Link href="/"><Image src={logo} width={60} height={60} className="ml-8" alt="logo" area-label="logo" /> </Link>

          <div className="flex items-center gap-2 lg:gap-4 mr-4 lg:mr-9">

            <div>
                          <Link href="/cart" className="relative m-2">
              <FontAwesomeIcon className="fa-solid fa-cart-shopping text-white w-8" icon={faCartShopping} />
              {cartCount > 0 && (
                <span className="absolute -top-3 left-4 bg-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="https://wa.me/+201155060205" className='m-2' area-label="whatsapp" >
              <FontAwesomeIcon className="fa-brands fa-whatsapp text-white text-3xl" icon={faWhatsapp} />
            </Link>
            </div>

          </div>
        </div>
      </div>



    </>
  )
}