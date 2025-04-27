"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button } from "@mui/material"
import Link from "next/link"

export default function HeroBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Array of background images for the slideshow
  const backgroundImages = [
    "./images/HeroBanner.svg",
    "https://gcs.tripi.vn/public-tripi/tripi-feed/img/473655Rej/scottish-fold-11932.jpg",
    "https://kimipet.vn/wp-content/uploads/2021/06/Scottish-Fold-cute-.jpg",
    "https://cdn.tgdd.vn/Files/2021/04/22/1345402/8-giong-meo-dep-va-pho-bien-duoc-yeu-thich-o-viet-nam-202104221315513099.jpg",
  ]

  // Set up the slideshow interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1))
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        px: { xs: 6, md: 40 },
        py: { xs: 10, md: 20 },
        mb: "90px",
        overflow: "hidden",
      }}
    >
      {/* Background images with fade transition */}
      {backgroundImages.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: currentImageIndex === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: -1,
          }}
        />
      ))}

      {/* Content - remains the same */}
      <Box sx={{ maxWidth: { xs: "90%", md: "50%" }, textAlign: "left", zIndex: 1 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
          Build Skills With <br /> Online Course
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Get started with modern education and skills that help you get ahead and stay ahead. Thousands of courses to
          help you grow.
        </Typography>
        <Link href="/courses">
          <Button variant="contained" color="warning" sx={{ borderRadius: "50px", px: 4, mt: 3 }}>
            Get Started
          </Button>
        </Link>
      </Box>
    </Box>
  )
}
