# What to Test in Form Components

## Field-Level Tests

For each form field (email, password, name, etc.):

### Validation States
- ✅ **No errors** - `issues()` returns empty array
- ✅ **Single error** - `issues()` returns one error message
- ✅ **Multiple errors** - `issues()` returns multiple error messages
- ✅ **Error message display** - Verify errors appear in UI
- ✅ **Error message content** - Verify correct error text is shown

### Field Attributes
- ✅ **Input type** - Correct `type` attribute (email, password, text)
- ✅ **Field name** - Correct `name` attribute
- ✅ **Field ID** - Correct `id` attribute (for labels)
- ✅ **Required status** - `required` attribute if needed
- ✅ **Placeholder text** - Correct placeholder if applicable
- ✅ **Autocomplete** - Correct autocomplete values

### Field Values
- ✅ **Initial value** - Default/empty state
- ✅ **Value getter** - `value()` returns current field value

## Form-Level Tests

### Form Structure
- ✅ **Form element exists** - Verify form is rendered
- ✅ **Form action** - Correct `action` attribute
- ✅ **Form method** - Correct `method` attribute (POST/GET)
- ✅ **Form submission** - Correct event handlers attached

### Submit Button
- ✅ **Button text** - Correct text in different states
- ✅ **Button type** - `type="submit"` attribute
- ✅ **Button disabled state** - Disabled when `pending > 0`
- ✅ **Loading text** - Shows loading message when submitting
- ✅ **Button enabled** - Enabled when `pending === 0`

## State Management Tests

### Pending States
- ✅ **Idle state** - `pending = 0`, button enabled
- ✅ **Submitting state** - `pending > 0`, button disabled, loading text
- ✅ **Multiple submissions** - Handle `pending > 1` if applicable

### Result States
- ✅ **Success state** - Handle successful form result
- ✅ **Error state** - Handle form submission errors
- ✅ **Initial state** - No result yet

## Multi-Field Interaction Tests

### Combined Validation
- ✅ **All fields valid** - No error messages shown
- ✅ **One field invalid** - Only that field's error shown
- ✅ **Multiple fields invalid** - All appropriate errors shown
- ✅ **Mixed valid/invalid** - Correct combination of errors

### Field Dependencies
- ✅ **Password confirmation** - Matching passwords
- ✅ **Conditional fields** - Fields that appear based on other inputs
- ✅ **Cross-field validation** - Validation spanning multiple fields

## Accessibility Tests

### Labels and ARIA
- ✅ **Field labels** - Associated labels exist
- ✅ **Error announcements** - Errors properly announced
- ✅ **Button state** - Disabled state announced
- ✅ **Form instructions** - Clear form instructions if needed

### Keyboard Navigation
- ✅ **Tab order** - Logical tab order through fields
- ✅ **Submit with Enter** - Enter key submits form
- ✅ **Focus management** - Focus after errors/validation

## Edge Cases

### Empty Form
- ✅ **Submit all empty** - All required field errors
- ✅ **Partial empty** - Only empty required fields error

### Special Characters
- ✅ **Email with special chars** - Handle `+`, `.`, `-` etc.
- ✅ **Password with spaces** - Handle leading/trailing spaces
- ✅ **Unicode characters** - Handle international characters

### Maximum Values
- ✅ **Email length limits** - Very long emails
- ✅ **Password length limits** - Minimum and maximum lengths
- ✅ **Field character limits** - Any applicable limits

## Data Flow Tests

### Mock Verification
- ✅ **Issues called** - `issues()` called for each field
- ✅ **As called** - `as()` called with correct input type
- ✅ **Value called** - `value()` called when needed
- ✅ **Mock call counts** - Correct number of calls

### Form Submission
- ✅ **Enhance function** - Form enhancement applied
- ✅ **Validation called** - Pre-submission validation
- ✅ **Submit prevention** - Form doesn't submit with errors

## Remember
- Test WHAT users see, not HOW the code works
- Use specific error messages, not generic text
- Clean up mocks between tests with `beforeEach`
- Each test should test ONE specific behavior
- Write descriptive test names that explain what's being tested