"use client";
import {AnimatePresence,motion,useReducedMotion} from "motion/react";
import {cn} from "@/lib/utils";
export function DigitSwap({value,animationKey,direction="up",suffixLength=0,glyphClassName,suffixClassName,className}:{value:string;animationKey:string;direction?:"up"|"down";suffixLength?:number;glyphClassName?:string;suffixClassName?:string;className?:string}){
 const reduced=useReducedMotion();const offset=direction==="up"?8:-8;
 return <span className={cn("inline-flex whitespace-pre",className)}>{Array.from(value).map((char,i)=><span key={i} className={cn("relative inline-block overflow-hidden align-bottom",i>=value.length-suffixLength?suffixClassName:glyphClassName)}><AnimatePresence initial={false} mode="popLayout"><motion.span key={animationKey+char} initial={{opacity:0,y:reduced?0:offset}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-offset}} transition={{duration:reduced?.1:.22,delay:reduced?0:i*.008}} className="inline-block">{char}</motion.span></AnimatePresence></span>)}</span>
}
