import type React from "react";
import type { Component } from "~/utils/types";
import { CoursesListingInline, HeroArea } from "~/components";

function renderComponent(component: Component) {
  let RenderComponent: React.ElementType;

  switch (component.__component) {
    case "block.hero":
      RenderComponent = HeroArea;
      break;
    case "block.courses-listing-inline":
      RenderComponent = CoursesListingInline;
      break;
    default:
      return null;
  }

  // Extract metadata fields and spread the rest as props
  const { __component, id, createdAt, updatedAt, ...props } = component;

  return <RenderComponent key={id} {...props} />;
}

function renderComponents(components: Component[]): React.ReactNode[] {
  const renderedBlocks: React.ReactNode[] = [];

  for (let i = 0; i < components.length; i++) {
    renderedBlocks.push(renderComponent(components[i]));
  }

  return renderedBlocks;
}

export default renderComponents;
