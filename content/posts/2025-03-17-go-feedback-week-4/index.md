---
title: Go Feedback Week 4
date: 2025-03-17
canonicalURL: https://haseebmajid.dev/posts/2025-03-17-go-feedback-week-4
tags:
  - gofeedback
  - buildinpublic
  - micro-saas
cover:
  image: images/cover.png
---

### This week

I decided to use wristband to the tenant and then organization on my side of the app. I am not fully happy with it.
During sign up the user creates a tenant but that might be confusing to the customer vs telling them its an organization.
But it does mean a new user is created and tenant on both wristband side and in the service database.

Then I moved onto working on the subscription logic with paddle. Updated the pricing page to pull in data from the
backend when populating the page. Also integrating the overlay checkout, which is the simplest way to integrate
paddle with my app. I cannot style it as much as the inline one, but it involves writing less JS. So I will use that
for now. I am finishing off the subscription webhook logic, to create the data on our side.

### Next week

Next week I want to;

- Fix auth refresh token flow not fully working
- Add span information to the auth middleware
- Simplify templ with pop drilling
- Update project name

Go Feedback can be confused with the Go programming language. I spoke to the Go team and they said I could either change the mascot.
or the name. I wasn't super fond of the name much so will look to rebrand and update everywhere its called Go Feedback.
