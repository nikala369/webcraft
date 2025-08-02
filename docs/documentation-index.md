# 📚 Webcraft Documentation Index

## **🎯 OVERVIEW**

This is the central index for all Webcraft architectural documentation. Use this guide to quickly find the information you need for development, debugging, and maintenance.

---

## **🚨 CRITICAL TROUBLESHOOTING GUIDES**

### **🔧 Primary Troubleshooting Reference**

- **[Webcraft Architectural Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md)**
  - **Use when**: Debugging any component or architectural issue
  - **Contains**: Step-by-step solutions for 6 critical issue categories
  - **Key sections**: Change detection, image loading, button states, data loss, template creation, component paths

### **📊 Data Flow & Component Communication**

- **[Component Data Flow Documentation](./component-data-flow.md)**
  - **Use when**: Understanding how data moves through the application
  - **Contains**: Angular OnPush patterns, reactive image loading, loading state management
  - **Key sections**: Critical architectural patterns, data flow architecture, debugging checklist

### **🏗️ Core Component Architecture**

- **[PreviewComponent Architecture Analysis](./preview-component-architecture-analysis.md)**
  - **Use when**: Working with the main preview component
  - **Contains**: Complete architectural analysis of the central orchestrator
  - **Key sections**: State management, component integration, performance patterns

---

## **⚡ QUICK REFERENCE GUIDES**

### **🎨 Component Development**

- **[Component Development Guide](./component-development-guide.md)**
  - Standard component patterns and best practices
  - Signal-based reactive architecture guidelines

### **🖼️ Image System**

- **[Image Upload System Guide](./image-upload-system-guide.md)**
  - Complete image handling and upload system documentation
  - Context-aware placeholder management

### **🎛️ Customization System**

- **[Component Customizer Guide](./component-customizer-guide.md)**
  - Sidebar customization interface patterns
  - Field configuration and validation

---

## **🔍 ARCHITECTURAL REFERENCES**

### **📋 Code Quality & Standards**

- **[Code Quality Review](./code-quality-review.md)**
  - **CRITICAL**: Contains bug prevention patterns discovered during debugging
  - ImageService data loss prevention rules
  - Logo placeholder management patterns
  - Angular change detection with OnPush components

### **🏛️ System Architecture**

- **[Architecture Summary](./architecture-summary.md)**
  - High-level system overview
  - Service relationships and responsibilities

### **📡 Backend Integration**

- **[Backend Integration Guide](./backend-integration-guide.md)**
  - API interaction patterns
  - Data persistence strategies

---

## **📈 PROJECT MANAGEMENT**

### **🎯 Development Progress**

- **[Project Status Overview](./project-status-overview.md)**
  - Current development status
  - Completed and pending features

### **🚀 Development Roadmap**

- **[Development Roadmap](./development-roadmap.md)**
  - Future development plans
  - Priority feature list

### **📊 Recent Updates**

- **[Recent Improvements Summary](./recent-improvements-summary.md)**
  - Latest bug fixes and enhancements
  - Performance improvements

---

## **💎 PLAN-SPECIFIC DOCUMENTATION**

### **⭐ Standard Plan**

- **[Standard Plan Enhancement Guide](./standard-plan-enhancement-guide.md)**
  - Standard plan feature development
  - Component customization capabilities

### **💎 Premium Plan**

- **[Premium Development Plan](./premium-development-plan.md)**
  - Premium plan architecture
  - Advanced feature implementations

### **⚖️ Plan Comparison**

- **[Plan Comparison](./plan-comparison.md)**
  - Feature differences between plans
  - Implementation strategy

---

## **🔧 CONFIGURATION REFERENCES**

### **📋 Component Schema**

- **[Standard Customization Schema](./standard-customization-schema.json)**
  - Complete component configuration schema
  - Field definitions and validation rules

---

## **🎯 DEVELOPER WORKFLOW GUIDE**

### **🚨 When You Have a Bug**

1. **Start Here**: [Webcraft Architectural Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md)

   - Identify symptom category (Visual, Image, Button, Data, Flow, Selection)
   - Follow diagnostic steps
   - Apply solution pattern

2. **Need Data Flow Help**: [Component Data Flow Documentation](./component-data-flow.md)

   - Understanding reactive patterns
   - Signal-based architecture

3. **Working with PreviewComponent**: [PreviewComponent Architecture Analysis](./preview-component-architecture-analysis.md)
   - Template creation flows
   - State management patterns

### **🏗️ When Building New Features**

1. **Review Patterns**: [Code Quality Review](./code-quality-review.md)

   - Follow established architectural patterns
   - Avoid documented pitfalls

2. **Component Development**: [Component Development Guide](./component-development-guide.md)

   - Standard development patterns
   - Best practices

3. **Customization Features**: [Component Customizer Guide](./component-customizer-guide.md)
   - Sidebar interface patterns
   - Field configuration

### **🎨 When Working with Images**

1. **Primary Reference**: [Image Upload System Guide](./image-upload-system-guide.md)

   - Complete image system documentation
   - Upload and display patterns

2. **Troubleshooting**: [Webcraft Architectural Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md) → Section 2
   - Reactive image loading patterns
   - Placeholder management

### **💾 When Working with Data**

1. **Data Flow**: [Component Data Flow Documentation](./component-data-flow.md)

   - How data moves through components
   - Signal-based reactivity

2. **Data Loss Prevention**: [Code Quality Review](./code-quality-review.md) → Critical Bug Prevention
   - ImageService cleaning patterns
   - Data exclusion rules

---

## **📚 DOCUMENTATION MAINTENANCE**

### **When to Update Documentation**

- **After fixing critical bugs**: Update troubleshooting guides with new patterns
- **When adding new components**: Update architectural documentation
- **After performance improvements**: Update optimization guides
- **When changing data flow**: Update component data flow documentation

### **Documentation Standards**

1. **Use consistent formatting**: Follow existing document structure
2. **Include code examples**: Always provide working code snippets
3. **Add troubleshooting sections**: Include diagnostic steps and solutions
4. **Cross-reference documents**: Link to related documentation
5. **Update this index**: Add new documents to the appropriate sections

---

## **🎯 SUCCESS METRICS**

Our documentation should help developers:

- ✅ **Resolve 90%+ of issues** using troubleshooting guides
- ✅ **Implement new features** following established patterns
- ✅ **Avoid regressions** by understanding critical architectural patterns
- ✅ **Onboard quickly** with comprehensive architectural references
- ✅ **Maintain code quality** with clear standards and examples

---

## **📞 EMERGENCY REFERENCE**

### **Critical Issue Categories & Quick Fixes**

| Issue Type                          | Quick Diagnostic                    | Primary Document                                                                                                               | Solution Pattern                      |
| ----------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| **Styles not updating**             | Data in console but no UI change    | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#1-component-styles-not-updating-after-data-changes)  | Convert functions to computed signals |
| **Images showing placeholders**     | Correct data but default image      | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#2-images-showing-default-placeholder-initially)      | Reactive image URL computation        |
| **Wrong button states**             | Buttons disappear after save        | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#3-buttons-showing-wrong-state-after-save-operations) | Immediate loading state clearing      |
| **Data becomes undefined**          | Colors/settings reset to default    | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#4-data-loss-during-imageservice-processing)          | ImageService exclusion logic          |
| **Template creation fails**         | "Unable to create template" error   | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#5-template-creation-flow-failures)                   | State validation and error handling   |
| **Component updates wrong section** | Header changes affect about section | [Troubleshooting Guide](./webcraft-architectural-troubleshooting-guide.md#6-component-path-vs-key-selection-issues)            | Path vs key component distinction     |

---

**Last Updated**: January 2025  
**Version**: 2.0 - Post Standard Plan Enhancement Sprint  
**Maintainer**: Development Team

This index should be your starting point for all Webcraft development and debugging activities. All documentation here is battle-tested and reflects the current production architecture.
