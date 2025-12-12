# Form Testing Checklist

## Field-Level Tests

For each form field (email, password, name, etc.):

### Validation
- [ ] No errors when `issues()` returns empty array
- [ ] Single error message displayed when `issues()` returns one error
- [ ] Multiple error messages displayed when `issues()` returns multiple errors
- [ ] Error message content matches expected text

### Input Attributes
- [ ] Correct `type` attribute (email, password, text)
- [ ] Correct `name` attribute
- [ ] Correct `id` attribute (for labels)
- [ ] `required` attribute if needed
- [ ] `placeholder` text if applicable
- [ ] `autocomplete` values if needed

## Form-Level Tests

### Form Structure
- [ ] Form element rendered
- [ ] Correct `action` attribute
- [ ] Correct `method` attribute (POST/GET)
- [ ] Submit button has `type="submit"`

### Submit Button
- [ ] Shows correct text when idle
- [ ] Shows loading text when `pending > 0`
- [ ] Disabled when `pending > 0`
- [ ] Enabled when `pending === 0`

## State Management

### Pending States
- [ ] Idle state: `pending = 0`, button enabled
- [ ] Submitting state: `pending > 0`, button disabled
- [ ] Loading text appears during submission

### Result States
- [ ] Success state handling
- [ ] Error state handling
- [ ] Initial state (no result)

## Multi-Field Interaction

### Combined Validation
- [ ] All fields valid: no error messages
- [ ] One field invalid: only that field's error shown
- [ ] Multiple fields invalid: all appropriate errors shown

### Field Dependencies
- [ ] Password confirmation matching
- [ ] Conditional fields (if applicable)
- [ ] Cross-field validation (if applicable)

## Accessibility

- [ ] Field labels associated with inputs
- [ ] Error messages properly announced
- [ ] Button state changes announced
- [ ] Logical tab order through fields

## Mock Verification

For each test, verify:
- [ ] `issues()` called for each field
- [ ] `as()` called with correct input type
- [ ] `value()` called when needed
- [ ] Correct mock call counts
- [ ] Mocks properly cleaned up with `beforeEach`

## Test Organization

- [ ] Tests grouped by feature (validation, interaction, state)
- [ ] Each test tests ONE specific behavior
- [ ] Descriptive test names explaining what's being tested
- [ ] Clean separation between positive and negative cases

Remember: Test WHAT users see, not HOW the code works. Use specific error messages, not generic text.