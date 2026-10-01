import {
  FaCss3Alt,
  FaHtml5,
  FaNodeJs,
  FaReact,
  FaTwitter,
} from "react-icons/fa";
import { BsJavascript, BsTypescript } from "react-icons/bs";
import { MdCss, MdHtml, MdJavascript } from "react-icons/md";
import { RiNextjsFill, RiTailwindCssFill } from "react-icons/ri";
import { TbBrandThreejs } from "react-icons/tb";
import { SiGsap } from "react-icons/si";

const ExperienceCardLogos = ({ index }: { index: number }) => {
  return (
    <>
      {index === 0 ? (
        // Card 1
        <div>
          <FaHtml5
            size={70}
            className="absolute top-8 right-0 text-[#E44D25] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <FaCss3Alt
            size={70}
            className="absolute top-25 right-15 text-[#2965F1] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
        </div>
      ) : index === 1 ? (
        // Card 2
        <BsJavascript
          size={90}
          className="absolute top-16 left-3 text-[#F7C43C] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
        />
      ) : index === 2 ? (
        // Card 3
        <div>
          <MdHtml
            size={65}
            className="absolute top-12 -right-3 text-primary-purple hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <MdCss
            size={65}
            className="absolute top-18 right-15 text-primary-hover hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <MdJavascript
            size={65}
            className="absolute top-26 right-2 text-primary-yellow hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <FaReact
            size={55}
            className="absolute top-35 right-22 text-[#00D1F7] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <RiTailwindCssFill
            size={55}
            className="absolute top-42 right-4 text-[#41A2AE] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <BsTypescript
            size={45}
            className="absolute top-31 -right-11 text-[#2F74C0] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
        </div>
      ) : index === 3 ? (
        // Card 4
        <FaTwitter
          size={100}
          className="absolute top-16 left-2 text-[#009DED] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
        />
      ) : index === 4 ? (
        // Card 5
        <RiNextjsFill
          size={110}
          className="absolute top-13 -right-2 text-primary-white hover:-translate-y-1 hover:scale-110 transition-all duration-200"
        />
      ) : index === 5 ? (
        // Card 6
        <svg
          width={140}
          height={140}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-8 -left-4 hover:-translate-y-1 hover:scale-110 transition-all duration-200"
        >
          {/* S */}
          <path
            d="M7 8h-3a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-3"
            stroke="#4181ED"
            className="transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-110 transform-fill origin-center"
          />

          {/* E */}
          <g className="transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-110 transform-fill origin-center">
            <path d="M14 16h-4v-8h4" stroke="#F2B605" />
            <path d="M11 12h2" stroke="#F2B605" />
          </g>

          {/* O */}
          <path
            d="M17 8m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"
            stroke="#E34033"
            className="transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-110 transform-fill origin-center"
          />
        </svg>
      ) : index === 6 ? (
        // Card 7
        <div>
          <FaNodeJs
            size={60}
            className="absolute top-6 right-5 text-[#509941] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <TbBrandThreejs
            size={60}
            className="absolute top-18 right-22 text-primary-white hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
          <SiGsap
            size={70}
            className="absolute top-23 right-1 text-[#0ADD46] hover:-translate-y-1 hover:scale-110 transition-all duration-200"
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default ExperienceCardLogos;
